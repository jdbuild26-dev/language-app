import { useState, useEffect } from "react";
import { useUser, useAuth } from "@clerk/clerk-react";
import {
  Volume2,
  Bookmark,
  BookmarkCheck,
  FileText,
  List,
  Languages,
} from "lucide-react";
import { useSpeechSynthesis } from "../../../../hooks/useSpeechSynthesis";
import {
  addToReview,
  removeFromReview,
  checkIsBookmarked,
} from "../../../../services/reviewCardsApi";
import { trackEvent } from "../../../../services/eventTrackerApi";

// Placeholder image for words without images
const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=500";

export default function LearningCard({ word, sessionId }) {
  const { user } = useUser();
  const { getToken } = useAuth();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [speakingId, setSpeakingId] = useState(null);
  const { speak, isSpeaking, isSupported } = useSpeechSynthesis();
  const imageUrl = word.image || PLACEHOLDER_IMAGE;

  // Check if card is already bookmarked when component mounts or word changes
  useEffect(() => {
    async function checkBookmarkStatus() {
      if (user && word?.id) {
        try {
          const token = await getToken();
          const bookmarked = await checkIsBookmarked(token, word.id);
          setIsBookmarked(bookmarked);
        } catch (e) {
          console.error("Failed to check bookmark", e);
        }
      }
    }
    checkBookmarkStatus();
  }, [user, word?.id, getToken]);

  // Reset speaking state when speech ends
  useEffect(() => {
    if (!isSpeaking) {
      setSpeakingId(null);
    }
  }, [isSpeaking]);

  const handleBookmarkToggle = async () => {
    if (!user || isLoading) return;

    setIsLoading(true);
    try {
      const token = await getToken();
      if (isBookmarked) {
        await removeFromReview(token, word.id);
        setIsBookmarked(false);
      } else {
        await addToReview(token, word);
        setIsBookmarked(true);
      }

      // Track bookmark event
      trackEvent({
        sessionId,
        itemId: word.id,
        interactionType: "bookmark",
        metadata: {
          action: !isBookmarked ? "add" : "remove",
          word: word.english,
        },
      });
    } catch (error) {
      console.error("Failed to toggle bookmark:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpeak = (text, id) => {
    if (!isSupported) {
      console.warn("Text-to-speech not supported in this browser");
      return;
    }
    setSpeakingId(id);
    speak(text, "fr-FR");

    // Track speak event
    trackEvent({
      sessionId,
      itemId: word.id,
      interactionType: "speak",
      metadata: { text, context: id },
    });
  };

  // Mock frequency if not provided
  const frequency = word.frequency || "High";
  const frequencyPercentage =
    frequency.toLowerCase() === "high"
      ? 85
      : frequency.toLowerCase() === "medium"
        ? 60
        : 30;

  // Prepare examples array
  const examples =
    word.examples && word.examples.length > 0
      ? word.examples
      : [
          {
            target: word.exampleTarget,
            native: word.exampleNative,
            level: word.level || "A1",
            phonetic: word.phonetic,
          },
        ];

  return (
    <div className="bg-[#f8fafc] dark:bg-slate-900 rounded-[2rem] p-6 lg:p-10 w-full max-w-[1400px] mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.8fr_1.2fr] gap-8 lg:gap-10">
        {/* Left Column: Image & Stats */}
        <div className="flex flex-col">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] border border-gray-100 dark:border-slate-700 flex flex-col h-fit">
            <div className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden bg-gray-50 mb-6 flex-shrink-0">
              <img
                src={imageUrl}
                alt={word.english}
                className="w-full h-full object-cover rounded-xl"
              />
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              <span className="px-3 py-1 bg-[#f0f4ff] dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 rounded-full text-[11px] font-bold tracking-wide uppercase">
                Noun
              </span>
              <span className="px-3 py-1 bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-300 rounded-full text-[11px] font-bold tracking-wide uppercase">
                {word.category}
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-bold mb-2">
                  <span className="text-gray-400 dark:text-gray-500">
                    CEFR Level
                  </span>
                  <span className="text-blue-600 dark:text-blue-400">
                    {word.level || "A1"}
                  </span>
                </div>
                <div className="h-2 w-full bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full"
                    style={{
                      width:
                        word.level === "A1"
                          ? "20%"
                          : word.level === "A2"
                            ? "40%"
                            : word.level === "B1"
                              ? "60%"
                              : word.level === "B2"
                                ? "80%"
                                : "100%",
                    }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-2">
                  <span className="text-gray-400 dark:text-gray-500">
                    Frequency
                  </span>
                  <span className="text-[#111827] dark:text-gray-200">
                    {frequency}
                  </span>
                </div>
                <div className="h-2 w-full bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full"
                    style={{ width: `${frequencyPercentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Middle Column: Content */}
        <div className="flex flex-col pt-2 max-w-2xl">
          {/* Header Section */}
          <div className="mb-10 flex flex-col items-start space-y-2 relative">
            <h1 className="text-[3.5rem] md:text-[4rem] font-black text-[#111827] dark:text-white tracking-tight leading-none">
              {word.english}
            </h1>
          </div>

          {/* Forms Section - Side by Side */}
          <div className="flex gap-5 mb-10">
            {word.forms.slice(0, 2).map((form, idx) => {
              const isMasculine = form.gender.toLowerCase().includes("masc");
              const labelColor = isMasculine
                ? "text-blue-600 dark:text-blue-400"
                : "text-pink-500 dark:text-pink-400";
              const buttonBg = isMasculine
                ? "bg-blue-50 text-blue-600 hover:bg-blue-100"
                : "bg-pink-50 text-pink-500 hover:bg-pink-100";

              return (
                <div
                  key={idx}
                  className={`bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.03)] border relative flex-1 ${
                    isMasculine ? "border-blue-50" : "border-pink-50"
                  }`}
                >
                  <div className="flex justify-between items-start mb-6">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-[0.15em] ${labelColor}`}
                    >
                      {isMasculine ? "Masculine" : "Feminine"}
                    </span>
                    <button
                      onClick={() => handleSpeak(form.word, `form-${idx}`)}
                      className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors shadow-sm ${buttonBg} ${
                        speakingId === `form-${idx}` ? "animate-pulse" : ""
                      }`}
                    >
                      <Volume2
                        className="w-[18px] h-[18px]"
                        strokeWidth={2.5}
                      />
                    </button>
                  </div>

                  <div>
                    <p className="text-[2rem] font-bold text-[#111827] dark:text-white mb-2 leading-none">
                      {form.word}
                    </p>
                    <p className="text-[15px] font-medium text-gray-400 dark:text-gray-500">
                      {form.phonetic || (idx === 0 ? "/ʃjɛ̃/" : "/ʃjɛn/")}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Meaning Section */}
          <div className="mt-2 text-left">
            <div className="flex items-center gap-3 mb-5 pl-1">
              <FileText
                className="w-[18px] h-[18px] text-blue-600"
                strokeWidth={2.5}
              />
              <h3 className="text-[#111827] dark:text-white text-[17px] font-bold">
                Meaning
              </h3>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.03)] border border-gray-100 dark:border-slate-700 text-[#4b5563] dark:text-gray-300 leading-relaxed text-[16px]">
              <p>
                {word.definition ||
                  Array.from(new Set(word.forms.map((f) => f.word))).join(
                    " / ",
                  )}{" "}
                is a common domestic animal often kept as a pet. Known as "man's
                best friend," they are loyal companions that come in many breeds
                and sizes.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Examples */}
        <div className="flex flex-col pt-2 lg:-ml-4">
          <div className="flex items-center gap-3 mb-5 pl-1">
            <List
              className="w-[18px] h-[18px] text-blue-600"
              strokeWidth={2.5}
            />
            <h3 className="text-[#111827] dark:text-white text-[17px] font-bold">
              Usage Examples
            </h3>
          </div>

          <div className="space-y-4">
            {examples.map((ex, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.03)] border border-gray-100 dark:border-slate-700 relative flex flex-col justify-between min-h-[140px]"
              >
                <div className="absolute top-6 right-6">
                  <Languages
                    className="w-[18px] h-[18px] text-gray-300 dark:text-gray-600"
                    strokeWidth={2.5}
                  />
                </div>
                <div>
                  <div className="mb-4">
                    <span className="px-2.5 py-1 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded text-[10px] font-bold tracking-wide uppercase inline-block">
                      {ex.level || "A1 Beginner"}
                    </span>
                  </div>
                  <p className="text-[17px] font-bold text-[#111827] dark:text-white mb-2 italic pr-6 leading-snug">
                    "{ex.target}"
                  </p>
                  <p className="text-[15px] text-gray-500 dark:text-gray-400 font-medium pb-2">
                    {ex.native}
                  </p>
                </div>
              </div>
            ))}

            {/* Add a few more mock examples to match the design length if we only have one */}
            {examples.length === 1 && (
              <>
                <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.03)] border border-gray-100 dark:border-slate-700 relative flex flex-col justify-between min-h-[140px]">
                  <div className="absolute top-6 right-6">
                    <Languages
                      className="w-[18px] h-[18px] text-gray-300 dark:text-gray-600"
                      strokeWidth={2.5}
                    />
                  </div>
                  <div>
                    <div className="mb-4">
                      <span className="px-2.5 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded text-[10px] font-bold tracking-wide uppercase inline-block">
                        A2 Elementary
                      </span>
                    </div>
                    <p className="text-[17px] font-bold text-[#111827] dark:text-white mb-2 italic pr-6 leading-snug">
                      "Ma chienne aime jouer au parc."
                    </p>
                    <p className="text-[15px] text-gray-500 dark:text-gray-400 font-medium pb-2">
                      My dog likes to play at the park.
                    </p>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.03)] border border-gray-100 dark:border-slate-700 relative flex flex-col justify-between min-h-[140px]">
                  <div className="absolute top-6 right-6">
                    <Languages
                      className="w-[18px] h-[18px] text-gray-300 dark:text-gray-600"
                      strokeWidth={2.5}
                    />
                  </div>
                  <div>
                    <div className="mb-4">
                      <span className="px-2.5 py-1 bg-[#fff8e6] dark:bg-yellow-900/30 text-[#d97706] dark:text-yellow-400 rounded text-[10px] font-bold tracking-wide uppercase inline-block">
                        B1 Intermediate
                      </span>
                    </div>
                    <p className="text-[17px] font-bold text-[#111827] dark:text-white mb-2 italic pr-6 leading-snug">
                      "L'aboiement du chien a réveillé les voisins."
                    </p>
                    <p className="text-[15px] text-gray-500 dark:text-gray-400 font-medium pb-2">
                      The dog's barking woke up the neighbors.
                    </p>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.03)] border border-gray-100 dark:border-slate-700 relative flex flex-col justify-between min-h-[140px]">
                  <div className="absolute top-6 right-6">
                    <Languages
                      className="w-[18px] h-[18px] text-gray-300 dark:text-gray-600"
                      strokeWidth={2.5}
                    />
                  </div>
                  <div>
                    <div className="mb-4">
                      <span className="px-2.5 py-1 bg-[#fff1f2] dark:bg-rose-900/30 text-[#e11d48] dark:text-rose-400 rounded text-[10px] font-bold tracking-wide uppercase inline-block">
                        B2 Upper Int
                      </span>
                    </div>
                    <p className="text-[17px] font-bold text-[#111827] dark:text-white mb-2 italic pr-6 leading-snug">
                      "C'est un chien fidèle qui protège sa maison avec
                      vigilance."
                    </p>
                    <p className="text-[15px] text-gray-500 dark:text-gray-400 font-medium pb-2">
                      It is a faithful dog that protects its house vigilantly.
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
