import { useState, useEffect } from "react";
import { useUser, useAuth } from "@clerk/clerk-react";
import { Volume2, Bookmark, BookmarkCheck } from "lucide-react";
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

  return (
    <div className="bg-white dark:bg-slate-800 rounded-[2rem] p-6 md:p-8 shadow-xl border border-gray-100 dark:border-slate-700 w-full max-w-5xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-8 lg:gap-12">
        {/* Left Column: Image */}
        <div className="relative flex flex-col">
          {/* Review/New Badge */}
          <div className="absolute top-4 left-4 z-10 flex gap-2">
            <div
              className={`px-5 py-1.5 rounded-full text-sm font-bold tracking-wide shadow-sm text-white transition-colors ${
                isBookmarked ? "bg-sky-500" : "bg-red-600"
              }`}
            >
              {isBookmarked ? "Review" : "New"}
            </div>
          </div>

          <div className="w-full aspect-[4/5] rounded-3xl overflow-hidden shadow-md bg-gray-100 dark:bg-slate-900">
            <img
              src={imageUrl}
              alt={word.english}
              className="w-full h-full object-cover transform transition-transform duration-700 hover:scale-105"
            />
          </div>
        </div>

        {/* Right Column: Content */}
        <div className="flex flex-col">
          {/* Header Section */}
          <div className="flex justify-between items-start mb-6">
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 rounded-lg text-sm font-semibold">
                {word.category} • {word.level || "A1"}
              </span>
              <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-lg text-sm font-bold shadow-sm border border-indigo-100 dark:border-indigo-800/50">
                Noun
              </span>
            </div>

            <button
              onClick={handleBookmarkToggle}
              disabled={isLoading}
              className="text-gray-400 hover:text-sky-500 transition-colors"
            >
              {isBookmarked ? (
                <BookmarkCheck className="w-7 h-7 text-sky-500 fill-sky-500" />
              ) : (
                <Bookmark className="w-7 h-7" />
              )}
            </button>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-8">
            {word.english}
          </h1>

          {/* Forms Section - Side by Side */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {word.forms.map((form, idx) => {
              const isMasculine = form.gender.toLowerCase().includes("masc");
              const bgClass = isMasculine
                ? "bg-sky-50 dark:bg-sky-900/20 border-sky-100 dark:border-sky-800"
                : "bg-pink-50 dark:bg-pink-900/20 border-pink-100 dark:border-pink-800";
              const textClass = isMasculine
                ? "text-sky-600 dark:text-sky-400"
                : "text-pink-500 dark:text-pink-400";

              return (
                <div
                  key={idx}
                  className={`p-4 rounded-2xl border ${bgClass} flex flex-col justify-between min-h-[100px] relative group transition-all hover:shadow-md`}
                >
                  <button
                    onClick={() => handleSpeak(form.word, `form-${idx}`)}
                    className={`absolute top-4 left-4 p-1.5 rounded-full transition-colors ${
                      speakingId === `form-${idx}`
                        ? "bg-white/50 text-sky-600 animate-pulse"
                        : "text-gray-400 hover:bg-white/50 hover:text-sky-600"
                    }`}
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>

                  <div className="mt-8 text-center">
                    <p className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-1">
                      {form.word}
                    </p>
                    <p className={`text-sm font-medium ${textClass}`}>
                      {form.gender}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Meaning Section (Simulated based on design since data is missing) */}
          <div className="mb-8">
            <h3 className="text-gray-500 dark:text-gray-400 text-sm font-semibold uppercase tracking-wider mb-3">
              Meaning
            </h3>
            <ul className="space-y-2">
              {word.forms.map((form, idx) => (
                <li key={idx} className="text-gray-700 dark:text-gray-300">
                  <span className="font-serif italic font-medium text-gray-900 dark:text-white mr-2">
                    {form.word}
                  </span>
                  :{" "}
                  {form.gender.toLowerCase().includes("masc")
                    ? "male"
                    : "female"}{" "}
                  {word.english.toLowerCase()}
                </li>
              ))}
            </ul>
          </div>

          {/* Example Section */}
          <div className="mt-auto">
            <h3 className="text-gray-500 dark:text-gray-400 text-sm font-semibold uppercase tracking-wider mb-3">
              Example
            </h3>
            <div className="bg-sky-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-sky-100 dark:border-slate-700 relative overflow-hidden">
              {/* Decorative background element */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-sky-100 dark:bg-sky-900/20 rounded-bl-[4rem] -z-0 opacity-50"></div>

              <div className="flex gap-4 relative z-10">
                <button
                  onClick={() => handleSpeak(word.exampleTarget, "example")}
                  className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    speakingId === "example"
                      ? "bg-sky-200 dark:bg-sky-800 text-sky-700 dark:text-white animate-pulse"
                      : "bg-white dark:bg-slate-700 text-sky-500 hover:bg-sky-100 hover:scale-105 shadow-sm"
                  }`}
                >
                  <Volume2 className="w-5 h-5" />
                </button>

                <div>
                  <p className="text-lg font-bold text-gray-900 dark:text-white leading-relaxed mb-1">
                    {word.exampleTarget}
                  </p>
                  {word.phonetic && (
                    <p className="text-sm text-red-400 font-mono mb-2 tracking-wide text-opacity-80">
                      {word.phonetic}
                    </p>
                  )}
                  <p className="text-gray-500 dark:text-gray-400 italic">
                    {word.exampleNative}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
