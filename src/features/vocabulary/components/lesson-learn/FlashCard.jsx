import { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { Volume2 } from "lucide-react";
import BookmarkIcon from "./BookmarkIcon";
import { useSpeechSynthesis } from "../../../../hooks/useSpeechSynthesis";
import {
  addToReview,
  removeFromReview,
  checkIsBookmarked,
} from "../../../../services/reviewCardsApi";

// Placeholder image for words without images
const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=500";

export default function FlashCard({ word, showBookmark = true }) {
  const { user } = useUser();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [speakingId, setSpeakingId] = useState(null);
  const { speak, isSpeaking, isSupported } = useSpeechSynthesis();
  const imageUrl = word.image || PLACEHOLDER_IMAGE;

  // Check if card is already bookmarked when component mounts or word changes
  useEffect(() => {
    async function checkBookmarkStatus() {
      if (showBookmark && user && word?.id) {
        const bookmarked = await checkIsBookmarked(user.id, word.id);
        setIsBookmarked(bookmarked);
      }
    }
    checkBookmarkStatus();
  }, [showBookmark, user, word?.id]);

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
      if (isBookmarked) {
        await removeFromReview(user.id, word.id);
        setIsBookmarked(false);
      } else {
        await addToReview(user.id, word);
        setIsBookmarked(true);
      }
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
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-gray-100 dark:border-slate-700 w-full mx-auto overflow-hidden relative group">
      {/* Review Badge - Positioned Top Right */}
      <button
        onClick={handleBookmarkToggle}
        disabled={isLoading || !showBookmark}
        className={`absolute top-6 right-6 z-10 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all shadow-sm ${
          isBookmarked
            ? "bg-purple-600 text-white hover:bg-purple-700"
            : "bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-300"
        } ${isLoading ? "opacity-50 cursor-not-allowed" : ""} ${
          !showBookmark ? "hidden" : ""
        }`}
      >
        {isBookmarked ? "Reviewing" : "Mark for Review"}
      </button>

      <div className="flex flex-col md:flex-row min-h-[400px]">
        {/* Left: Image Section (~40%) */}
        <div className="md:w-2/5 p-6 md:p-8 bg-gray-50 dark:bg-slate-900/50 flex flex-col items-center justify-center relative border-b md:border-b-0 md:border-r border-gray-100 dark:border-slate-700">
          {/* Category & Level Tags - Floating top left of image area */}
          <div className="absolute top-6 left-6">
            <span className="px-2.5 py-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg text-xs font-medium text-gray-500 dark:text-slate-400 shadow-sm">
              {word.level || "A1"}
            </span>
          </div>

          <div className="relative w-full aspect-square max-w-[260px] rounded-2xl overflow-hidden shadow-lg ring-1 ring-gray-900/5 dark:ring-white/10">
            <img
              src={imageUrl}
              alt={word.english}
              className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-105"
            />
          </div>

          {/* Category tag below image */}
          <div className="mt-6 text-center">
            <span className="text-sm font-medium text-gray-400 dark:text-slate-500 uppercase tracking-widest">
              {word.category || "General"}
            </span>
          </div>
        </div>

        {/* Right: Content Section (~60%) */}
        <div className="md:w-3/5 p-6 md:p-10 flex flex-col justify-center">
          {/* Header: English Word */}
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              {word.english}
            </h2>
          </div>

          {/* French Forms */}
          <div className="flex flex-wrap gap-4 mb-8">
            {word.forms.map((form, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 px-4 py-3 bg-gray-50 dark:bg-slate-700/50 rounded-xl border border-gray-100 dark:border-slate-600 shadow-sm"
              >
                {/* Audio Button */}
                <button
                  onClick={() => handleSpeak(form.word, `form-${idx}`)}
                  disabled={isSpeaking || !isSupported}
                  className={`p-2 rounded-full shadow-sm transition-all ${
                    speakingId === `form-${idx}`
                      ? "bg-purple-100 dark:bg-purple-900/50 animate-pulse text-purple-600"
                      : "bg-white dark:bg-slate-600 hover:bg-gray-100 dark:hover:bg-slate-500 text-purple-600 dark:text-purple-400"
                  }`}
                >
                  <Volume2 className={`w-4 h-4`} />
                </button>

                <div>
                  <p className="text-xl font-semibold text-gray-900 dark:text-white">
                    {form.word}
                  </p>
                  <p className={`text-sm font-medium ${form.genderColor}`}>
                    {form.gender}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Example Section */}
          <div className="mt-auto">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide mb-3">
              Example
            </h3>
            <div className="bg-gray-50 dark:bg-slate-700/30 rounded-xl p-5 border border-gray-100 dark:border-slate-600">
              <div className="flex items-start gap-3 mb-2">
                <button
                  onClick={() => handleSpeak(word.exampleTarget, "example")}
                  disabled={isSpeaking || !isSupported}
                  className={`p-2 rounded-full shadow-sm transition-all flex-shrink-0 mt-0.5 ${
                    speakingId === "example"
                      ? "bg-purple-100 dark:bg-purple-900/50 animate-pulse text-purple-600"
                      : "bg-white dark:bg-slate-600 hover:bg-gray-100 dark:hover:bg-slate-500 text-purple-600 dark:text-purple-400"
                  }`}
                >
                  <Volume2 className="w-4 h-4" />
                </button>
                <div>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white leading-relaxed">
                    {word.exampleTarget}
                  </p>
                  {/* Phonetic */}
                  {word.phonetic && (
                    <p className="text-sm text-rose-400 italic mt-1 decoration-wavy underline decoration-rose-300">
                      {word.phonetic}
                    </p>
                  )}
                </div>
              </div>
              <p className="text-base text-gray-600 dark:text-slate-300 italic ml-11">
                {word.exampleNative}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
